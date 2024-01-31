// import styles from './FileInput.module.css'

// export interface FileInputProps {
//     id: string;
//     label: string;
//     value: string | null;
//     onChange: (newValue: string | null) => void;
//     widthToResize?: number;
// }

// export default function FileInputComp(props: FileInputProps) {
//     return (
//         <label className={styles.imgUploadLabel} htmlFor={props.id}><span>Bild suchen ...</span>
//         <input type='file' id={props.id} onChange={async (e) => {
//             const files = e.target.files;
//             if (files != null && files.length >= 1) {
//                 const file: File | null = files.item(0)
//                 if (file == null) return
//                 // if (file.size > (128 << 10)) {
//                 //     alert('Bitte keine Dateien größer als 128kB.');
//                 //     return;
//                 // }
//                 // const newImg = await blobToBase64(file);
//                 if (widthToResize != null) {

//                 }
//                 const newImg = await resizeImage(file, 400)
//                 props.onChange(newImg);
//             }

//         }} />
//     </label>

//     )
// }