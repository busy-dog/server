import { iSvcBullionsPriceInfo } from 'src/services';

import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { compact, iArray, iOmit, theLast } from '@busymango/utils';
import { isEmpty, isNonEmptyString } from '@busymango/is-esm';
import { decorator } from 'src/helpers';

/**
 * 获取当前国际金银价格（单位:美元/盎司）
 **/
export const iCtlBullionsPriceInfo = (api: string, app: Hono) => {
  app.get(
    api,
    validator('query', async (data, { json }) => {
      const id = Number(data.id);

      const code = compact(iArray(data.code));

      if (isNonEmptyString(data.id) && isNaN(id ?? 0)) {
        return json({ code: 400, message: 'id is must be number' });
      }

      return iOmit({ id, code }, isEmpty);
    }),
    async ({ json, req }) => {
      return json(
        decorator(theLast(await iSvcBullionsPriceInfo(req.valid('query')))),
      );
    },
  );
};
