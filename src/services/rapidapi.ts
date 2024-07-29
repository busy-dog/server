import { drive } from 'src/helpers';

interface BullionsPriceModel {
  /** 金价 美元/盎司 */
  gold: number;
  /** 银价 美元/盎司 */
  silver: number;
}

/**
 * 获取当前金价、银价
 */
export const iSvcBullionsPriceQuery = () =>
  drive<BullionsPriceModel>({
    api: `https://gold-price-live.p.rapidapi.com/get_metal_prices`,
    parse: async (res, ctx) => {
      ctx.body = (await res.json()) as BullionsPriceModel;
    },
  });
