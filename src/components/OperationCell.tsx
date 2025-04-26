import type { DefaultServerCellComponentProps, Operation } from "payload";

import styles from "./OperationCell.module.css";

export const OperationCell = (props: DefaultServerCellComponentProps) => {
  const cellData: Operation = props.cellData;
  if (!cellData) {
    return <span>Invalid</span>;
  }

  switch (cellData) {
    case "create":
      return <span className={styles.create}>{cellData}</span>;
    case "delete":
      return <span className={styles.delete}>{cellData}</span>;
    case "read":
      return <span className={styles.read}>{cellData}</span>;
    case "update":
      return <span className={styles.update}>{cellData}</span>;
  }
};
