import type { DefaultServerCellComponentProps } from "payload";

export const PreviousVersionIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;

  if (!rowData["resourceType"] || !rowData["documentId"]) {
    return <span>Not Found</span>;
  }
  if (!cellData) {
    return <span>None</span>;
  }

  return (
    <a
      href={`/admin/collections/${encodeURIComponent(rowData["resourceType"])}/${encodeURIComponent(rowData["documentId"])}/versions/${encodeURIComponent(cellData)}`}
    >
      {cellData}
    </a>
  );
};
