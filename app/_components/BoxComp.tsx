import { PropsWithChildren } from "react";
import styles from './BoxComp.module.css'

export interface BoxProps {
    selected?: boolean;
}

export default function BoxComp(props: PropsWithChildren<BoxProps>) {
    return (
        <div className={styles.box + (props.selected ? ' ' + styles.selected : '')}>
            {props.children}
        </div>
    )
}