import { isError } from '@busymango/is-esm';
import { assign, ifnot } from '@busymango/utils';

export const decorator = <T>(
  data: T,
  {
    code = -1,
    message,
  }: {
    code?: number;
    message?: string;
  } = {},
) =>
  assign<{
    code?: number;
    data?: T | null;
    message?: string;
    success: boolean;
  }>(
    {
      code,
      data: null,
      success: false,
      message: message ?? ifnot(isError(data) && data.message),
    },
    ifnot(
      !isError(data) && {
        data,
        code: 0,
        success: true,
      },
    ),
  );
