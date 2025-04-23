import type { DefaultServerCellComponentProps } from "payload";

export const PreviousVersionIDCell = (props: DefaultServerCellComponentProps) => {
  const { cellData, rowData } = props;

  if (!rowData["resourceURL"]) {
    return <span>Not Found</span>;
  }
  if (!cellData) {
    return <span>None</span>;
  }

  return <a href={`/admin/${rowData["resourceURL"]}/versions/${cellData}`}>{cellData}</a>;
};
