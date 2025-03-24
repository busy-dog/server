import { isError, merge } from 'remeda';
import { ensure } from 'src/utils';

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
  merge(
    {
      code,
      data: null,
      success: false,
      message: message ?? ensure(isError(data) && data.message),
    },
    ensure(
      !isError(data) && {
        data,
        code: 0,
        success: true,
      },
    ),
  );
