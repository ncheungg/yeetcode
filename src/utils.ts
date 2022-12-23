'use strict';

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
