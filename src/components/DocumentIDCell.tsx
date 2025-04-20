import type { DefaultServerCellComponentProps } from "payload";

export const DocumentIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;

  return <a href={`/admin/collections/${rowData["resourceType"]}/${cellData}`}>{cellData}</a>;
};
