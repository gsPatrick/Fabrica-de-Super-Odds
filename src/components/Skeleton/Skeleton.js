import styles from './Skeleton.module.css';
import { clsx } from 'clsx';

export default function Skeleton({
    className,
    variant = 'rect', // rect, circle, text
    width,
    height
}) {
    const style = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={clsx(styles.skeleton, styles[variant], className)}
            style={style}
            aria-hidden="true"
        />
    );
}
