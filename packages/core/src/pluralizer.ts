import type {
  PluralizationType,
  PluralCategory,
  LaravelPluralRule,
  TranslationValue,
} from './schemas/index.js';

/**
 * 複数形処理を行うクラス
 * Rails形式（キーベース）とLaravel形式（パイプ区切り）をサポート
 */
export class Pluralizer {
  private readonly type: PluralizationType;
  private readonly pluralRules: Intl.PluralRules;

  constructor(type: PluralizationType = 'key', locale: string = 'en') {
    this.type = type;
    this.pluralRules = new Intl.PluralRules(locale);
  }

  /**
   * Intl.PluralRulesのカテゴリを取得
   */
  private getPluralCategory(count: number): Intl.LDMLPluralRule {
    return this.pluralRules.select(count);
  }

  /**
   * Rails形式の複数形キーを解決
   * zero/one/two/few/many/other キーから適切なものを選択
   */
  resolveKeyBased(
    translations: Record<string, TranslationValue>,
    count: number
  ): TranslationValue | undefined {
    // count=0 の場合は zero キーを優先（Rails互換）
    if (count === 0 && 'zero' in translations) {
      return translations['zero'];
    }

    const category = this.getPluralCategory(count) as PluralCategory;

    // カテゴリに対応するキーがあればそれを使用
    if (category in translations) {
      return translations[category];
    }

    // フォールバック: other
    if ('other' in translations) {
      return translations['other'];
    }

    return undefined;
  }

  /**
   * Laravel形式のパイプ区切り文字列をパース
   * 例: "{0} None|{1} One item|[2,*] Many items"
   */
  parsePipeSeparated(text: string): LaravelPluralRule[] {
    const rules: LaravelPluralRule[] = [];
    const parts = this.splitByPipe(text);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      const rule = this.parseRule(part, i, parts.length);
      if (rule) {
        rules.push(rule);
      }
    }

    return rules;
  }

  /**
   * パイプで分割（エスケープを考慮）
   */
  private splitByPipe(text: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inBracket = false;

    for (const char of text) {
      if (char === '[' || char === '{') {
        inBracket = true;
      } else if (char === ']' || char === '}') {
        inBracket = false;
      }

      if (char === '|' && !inBracket) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * 個別のルールをパース
   */
  private parseRule(
    part: string,
    index: number,
    totalParts: number
  ): LaravelPluralRule | null {
    // {n} 形式（完全一致）
    const exactMatch = part.match(/^\{(\d+)\}\s*(.*)$/);
    if (exactMatch) {
      return {
        exact: parseInt(exactMatch[1], 10),
        text: exactMatch[2],
      };
    }

    // [n,m] または [n,*] 形式（範囲指定）
    const rangeMatch = part.match(/^\[(\d+),(\d+|\*)\]\s*(.*)$/);
    if (rangeMatch) {
      return {
        rangeStart: parseInt(rangeMatch[1], 10),
        rangeEnd: rangeMatch[2] === '*' ? Infinity : parseInt(rangeMatch[2], 10),
        text: rangeMatch[3],
      };
    }

    // 単純な形式（One|Many）
    if (totalParts === 2) {
      // 2つの場合: 最初が単数、2番目が複数
      if (index === 0) {
        return { exact: 1, text: part };
      } else {
        return { rangeStart: 0, rangeEnd: Infinity, text: part };
      }
    }

    // その他の場合はテキストのみ
    return { text: part };
  }

  /**
   * Laravel形式の複数形を解決
   */
  resolvePipeBased(text: string, count: number): string {
    const rules = this.parsePipeSeparated(text);

    for (const rule of rules) {
      // 完全一致
      if (rule.exact !== undefined && rule.exact === count) {
        return rule.text;
      }

      // 範囲一致
      if (
        rule.rangeStart !== undefined &&
        rule.rangeEnd !== undefined &&
        count >= rule.rangeStart &&
        count <= rule.rangeEnd
      ) {
        return rule.text;
      }
    }

    // マッチしない場合は最後のルールを返す
    return rules.length > 0 ? rules[rules.length - 1].text : text;
  }

  /**
   * 複数形を解決（タイプに応じて処理を分岐）
   */
  resolve(
    value: TranslationValue,
    count: number
  ): TranslationValue | undefined {
    if (this.type === 'key') {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return this.resolveKeyBased(
          value as Record<string, TranslationValue>,
          count
        );
      }
      return value;
    }

    if (this.type === 'pipe') {
      if (typeof value === 'string') {
        return this.resolvePipeBased(value, count);
      }
      return value;
    }

    return value;
  }

  /**
   * Rails形式からLaravel形式に変換
   */
  static keyToPipe(translations: Record<string, string>): string {
    const parts: string[] = [];

    if ('zero' in translations) {
      parts.push(`{0} ${translations['zero']}`);
    }
    if ('one' in translations) {
      parts.push(`{1} ${translations['one']}`);
    }
    if ('other' in translations) {
      parts.push(`[2,*] ${translations['other']}`);
    }

    return parts.join('|');
  }

  /**
   * Laravel形式からRails形式に変換
   */
  static pipeToKey(text: string): Record<string, string> | null {
    const pluralizer = new Pluralizer('pipe');
    const rules = pluralizer.parsePipeSeparated(text);
    const result: Record<string, string> = {};

    for (const rule of rules) {
      if (rule.exact === 0) {
        result['zero'] = rule.text;
      } else if (rule.exact === 1) {
        result['one'] = rule.text;
      } else if (
        rule.rangeStart !== undefined &&
        rule.rangeEnd === Infinity
      ) {
        result['other'] = rule.text;
      }
    }

    // 単純な 単数|複数 形式
    if (rules.length === 2 && Object.keys(result).length === 0) {
      result['one'] = rules[0].text;
      result['other'] = rules[1].text;
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * ロケールを変更
   */
  withLocale(locale: string): Pluralizer {
    return new Pluralizer(this.type, locale);
  }
}

/**
 * Rails形式のPluralizerを作成
 */
export function createRailsPluralizer(locale: string = 'en'): Pluralizer {
  return new Pluralizer('key', locale);
}

/**
 * Laravel形式のPluralizerを作成
 */
export function createLaravelPluralizer(locale: string = 'en'): Pluralizer {
  return new Pluralizer('pipe', locale);
}
