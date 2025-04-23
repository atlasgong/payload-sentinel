import type { DefaultServerCellComponentProps } from "payload";

export const ResourceURLCell = (props: DefaultServerCellComponentProps) => {
  const { cellData } = props;

  if (!cellData) {
    return <span>Something went wrong...</span>;
  }

  return <a href={`/admin/${cellData}`}>{cellData}</a>;
};
