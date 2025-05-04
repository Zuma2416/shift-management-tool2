// デバッグモードかどうかを判定
export const isDevelopment = process.env.NODE_ENV === 'development';

// デバッグログを出力する関数
export const debugLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// エラーログを出力する関数
export const errorLog = (error: Error, context?: string) => {
  if (isDevelopment) {
    console.error(`[ERROR]${context ? ` [${context}]` : ''} ${error.message}`, error);
  }
};

// パフォーマンス計測用の関数
export const measurePerformance = (label: string, callback: () => void) => {
  if (isDevelopment) {
    console.time(`[PERFORMANCE] ${label}`);
    callback();
    console.timeEnd(`[PERFORMANCE] ${label}`);
  } else {
    callback();
  }
}; 