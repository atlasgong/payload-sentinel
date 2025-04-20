import type { DefaultServerCellComponentProps } from "payload";

export const PreviousVersionIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;
  if (!cellData) {
    return <span>None</span>;
  }

  return (
    <a href={`/admin/collections/${rowData["resourceType"]}/${rowData["documentId"]}/versions/${cellData}`}>
      {cellData}
    </a>
  );
};
