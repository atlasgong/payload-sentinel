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
    <a href={`/admin/collections/${rowData["resourceType"]}/${rowData["documentId"]}/versions/${cellData}`}>
      {cellData}
    </a>
  );
};
