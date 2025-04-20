import type { DefaultServerCellComponentProps } from "payload";

export const DocumentIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;
  if (!cellData || !rowData["resourceType"]) {
    return <span>Not Found</span>;
  }

  return (
    <a href={`/admin/collections/${encodeURIComponent(rowData["resourceType"])}/${encodeURIComponent(cellData)}`}>
      {cellData}
    </a>
  );
};
