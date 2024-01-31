import styles from './ImgInputComp.module.css'
import { resizeImage } from '@/app/_lib/image';
import RowComp from './RowComp';

export interface ImgInputProps {
    id: string;
    label: string;
    value: string | null;
    onChange: (newValue: string | null) => void;
}

export default function ImgInputComp(props: ImgInputProps) {
    return (
        <div>
            <h2>{props.label}</h2>
            {
                props.value != null &&
                <img src={props.value} alt='bla' />
            }
            <RowComp>
                <label tabIndex={0} className={styles.imgUploadLabel} htmlFor={props.id}>Bild suchen ...
                    <div>
                        <input type='file' id={props.id} onChange={async (e) => {
                            const files = e.target.files;
                            if (files != null && files.length >= 1) {
                                const file: File | null = files.item(0)
                                if (file == null) return
                                // if (file.size > (128 << 10)) {
                                //     alert('Bitte keine Dateien größer als 128kB.');
                                //     return;
                                // }
                                // const newImg = await blobToBase64(file);
                                const newImg = await resizeImage(file, 400)
                                props.onChange(newImg);
                            }

                        }} />
                    </div>
                </label>
                {
                    props.value != null &&
                    <button tabIndex={0} onClick={() => props.onChange(null)}>Bild entfernen</button>
                }
            </RowComp>
        </div>
    )
}
