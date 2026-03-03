interface CategoryProgressProps {
    label: string;
    percent: number;
    color: string;
}

export default function CategoryProgress({ label, percent, color }: CategoryProgressProps) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
                <span>{label}</span>
                <span>{percent}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
