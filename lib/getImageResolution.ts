export default function getImageResolution(file: File) {
  return new Promise(
    (resolve: (value: { width: number; height: number }) => void, reject) => {
      const img = new Image();
      const src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(src);
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(src);
        reject(error.toString());
      };
      img.src = src;
    }
  );
}
