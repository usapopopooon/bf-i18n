import type { InterpolationOptions } from './schemas/index.js';
import {
  RailsInterpolationDefaults,
  LaravelInterpolationDefaults,
} from './schemas/index.js';

/**
 * 補間処理を行うクラス
 * Rails形式（%{var}）とLaravel形式（:var）の両方をサポート
 */
export class Interpolator {
  private readonly options: InterpolationOptions;
  private readonly pattern: RegExp;

  constructor(options: Partial<InterpolationOptions> = {}) {
    this.options = {
      ...RailsInterpolationDefaults,
      ...options,
    };
    this.pattern = this.buildPattern();
  }

  /**
   * 補間パターンの正規表現を構築
   */
  private buildPattern(): RegExp {
    const { prefix, suffix } = this.options;

    if (suffix) {
      // Rails形式: %{variable}
      const escapedPrefix = this.escapeRegExp(prefix);
      const escapedSuffix = this.escapeRegExp(suffix);
      return new RegExp(`${escapedPrefix}([a-zA-Z_][a-zA-Z0-9_]*)${escapedSuffix}`, 'g');
    } else {
      // Laravel形式: :variable（単語境界で終了）
      const escapedPrefix = this.escapeRegExp(prefix);
      return new RegExp(`${escapedPrefix}([a-zA-Z_][a-zA-Z0-9_]*)`, 'g');
    }
  }

  /**
   * 正規表現の特殊文字をエスケープ
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 文字列内の変数を補間
   */
  interpolate(text: string, values: Record<string, unknown> = {}): string {
    return text.replace(this.pattern, (match, varName: string) => {
      if (varName in values) {
        const value = values[varName];
        return value == null ? '' : String(value);
      }
      // 値が見つからない場合はそのまま残す
      return match;
    });
  }

  /**
   * 文字列から変数名を抽出
   */
  extractVariables(text: string): string[] {
    const variables: string[] = [];
    let match: RegExpExecArray | null;

    // パターンをリセット（グローバルフラグ使用時）
    const pattern = new RegExp(this.pattern.source, 'g');

    while ((match = pattern.exec(text)) !== null) {
      const varName = match[1];
      if (!variables.includes(varName)) {
        variables.push(varName);
      }
    }

    return variables;
  }

  /**
   * 補間形式を別の形式に変換
   */
  static convert(
    text: string,
    fromOptions: InterpolationOptions,
    toOptions: InterpolationOptions
  ): string {
    const fromInterpolator = new Interpolator(fromOptions);
    const variables = fromInterpolator.extractVariables(text);

    let result = text;
    for (const varName of variables) {
      const fromPattern = fromOptions.suffix
        ? `${fromOptions.prefix}${varName}${fromOptions.suffix}`
        : `${fromOptions.prefix}${varName}`;

      const toPattern = toOptions.suffix
        ? `${toOptions.prefix}${varName}${toOptions.suffix}`
        : `${toOptions.prefix}${varName}`;

      result = result.split(fromPattern).join(toPattern);
    }

    return result;
  }

  /**
   * Rails形式からLaravel形式に変換
   */
  static railsToLaravel(text: string): string {
    return Interpolator.convert(
      text,
      RailsInterpolationDefaults,
      LaravelInterpolationDefaults
    );
  }

  /**
   * Laravel形式からRails形式に変換
   */
  static laravelToRails(text: string): string {
    return Interpolator.convert(
      text,
      LaravelInterpolationDefaults,
      RailsInterpolationDefaults
    );
  }
}

/**
 * Rails形式のInterpolatorインスタンスを作成
 */
export function createRailsInterpolator(): Interpolator {
  return new Interpolator(RailsInterpolationDefaults);
}

/**
 * Laravel形式のInterpolatorインスタンスを作成
 */
export function createLaravelInterpolator(): Interpolator {
  return new Interpolator(LaravelInterpolationDefaults);
}
