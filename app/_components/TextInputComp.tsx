
export interface TextInputProps {
    id: string;
    area?: boolean;
    type?: string;
    label: string;
    value: string;
    onChange: (newValue: string) => void;
}

export default function TextInputComp(props: TextInputProps) {
    return (
        <div>
            <label htmlFor={props.id}>{props.label}</label>
            {
                props.area ?
                    <textarea value={props.value} onChange={(e) => props.onChange(e.target.value)} />
                    :
                    <input type={props.type ?? 'text'} id={props.id} value={props.value}
                        onChange={(e) => {
                            props.onChange(e.target.value);
                        }}
                    />

            }
        </div>
    )
}
