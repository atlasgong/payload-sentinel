import type { DefaultServerCellComponentProps } from "payload";

export const DocumentIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;
  if (!cellData) {
    return <span>Not Found</span>;
  }

  return <a href={`/admin/collections/${rowData["resourceType"]}/${cellData}`}>{cellData}</a>;
};
