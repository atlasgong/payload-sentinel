import type { DefaultServerCellComponentProps } from "payload";

export const PreviousVersionIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;
  if (!cellData) {
    return "None";
  }

  return (
    <a href={`/admin/collections/${rowData["resourceType"]}/${rowData["documentId"]}/versions/${cellData}`}>
      {cellData}
    </a>
  );
};
