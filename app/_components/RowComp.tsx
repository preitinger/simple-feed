import { PropsWithChildren } from "react";
import styles from './RowComp.module.css'

export interface RowProps {

}

export default function RowComp(props: PropsWithChildren<RowProps>) {
    return (
        <div className={styles.row}>
            {props.children}
        </div>
    )
}