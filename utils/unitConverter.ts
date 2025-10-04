// 単位変換のマッピングと変換関数

export interface UnitConversion {
    from: string;
    to: string;
    factor: number;
    pattern: RegExp;
}

// 単位変換のマッピング
export const UNIT_CONVERSIONS = [
    // 長さ
    { from: 'cm', to: 'inch', factor: 0.3937007874, pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*cm\b/gi },
    { from: 'mm', to: 'inch', factor: 0.0393700787, pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*mm\b/gi },
    { from: 'm',  to: 'ft',   factor: 3.280839895,  pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*m(?!\w)/gi },
    { from: 'km', to: 'mile', factor: 0.621371192,  pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*km\b/gi },

    // 重量
    { from: 'g',  to: 'oz',   factor: 0.0352739619, pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*g(?!\w)/gi },
    { from: 'kg', to: 'lb',   factor: 2.204622621,  pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*kg\b/gi },

    // 温度 (特別処理)
    { from: '°C', to: '°F',   factor: 0,            pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*°?C\b/gi },

    // 容量
    { from: 'ml', to: 'fl oz',factor: 0.0338140227, pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*ml\b/gi },
    { from: 'l',  to: 'gal',  factor: 0.264172052,  pattern: /([+-]?\d+(?:,\d{3})*(?:\.\d+)?)\s*[lL](?!\w)/gi },
] as const satisfies readonly UnitConversion[];

// 温度変換の特別関数
const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9 / 5) + 32;
};

// 単位変換を実行する関数
export const convertUnits = (text: string, conversions: UnitConversion[]): string => {
    let convertedText = text;

    conversions.forEach(conversion => {
        convertedText = convertedText.replace(conversion.pattern, (match, value) => {
            const numValue = parseFloat(value);
            let convertedValue: number;

            // 温度の特別処理
            if (conversion.from === '°C') {
                convertedValue = celsiusToFahrenheit(numValue);
            } else {
                convertedValue = numValue * conversion.factor;
            }

            // 小数点以下の桁数を調整
            const roundedValue = Math.round(convertedValue * 100) / 100;
            return `${roundedValue} ${conversion.to}`;
        });
    });

    return convertedText;
};

// 利用可能な変換オプションを取得
export const getAvailableConversions = (text: string): UnitConversion[] => {
    return UNIT_CONVERSIONS.filter(conversion =>
        conversion.pattern.test(text)
    );
};