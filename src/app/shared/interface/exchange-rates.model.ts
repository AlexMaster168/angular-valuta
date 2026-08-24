export interface StringNumberPair {
    [key: string]: number;
}

export interface ExchangeRatesResponse {
    base_code: string;
    rates: StringNumberPair;
}

export interface MappedCurrencyRateObject {
    currency: string;
    rate: number;
}
