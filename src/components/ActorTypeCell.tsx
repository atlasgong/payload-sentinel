import type { DefaultServerCellComponentProps } from "payload";

import styles from "./ActorTypeCell.module.css";

type ActorType = "api" | "system" | "user";

export const ActorTypeCell = (props: DefaultServerCellComponentProps) => {
  const actorType: ActorType | null = props.cellData;

  switch (actorType) {
    case "api":
      return <span className={styles.api}>API</span>;
    case "system":
      return <span className={styles.system}>System</span>;
    case "user":
      return <span className={styles.user}>User</span>;
    default:
      return <span className={styles.unknown}>Unknown</span>;
  }
};
