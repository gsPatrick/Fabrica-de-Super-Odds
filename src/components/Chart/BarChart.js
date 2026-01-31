import styles from './Chart.module.css';

export default function BarChart({ data, title, subTitle }) {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Prevent div by zero

    return (
        <div className={styles.chartCard}>
            <div className={styles.header}>
                <h3>{title}</h3>
                <p>{subTitle}</p>
            </div>
            <div className={styles.chartContainer}>
                {data.map((item, index) => (
                    <div key={index} className={styles.barGroup}>
                        <div
                            className={styles.bar}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={`${item.label}: ${item.value}`}
                        />
                        <span className={styles.label}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
