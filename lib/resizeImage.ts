async function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(src);
      resolve(img);
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(src);
      reject(error.toString());
    };

    img.src = src;
  });
}

export async function resizeImage(
  file: File,
  options: {
    maxWidth: number;
    maxHeight: number;
  }
): Promise<{ file: File; width: number; height: number }> {
  const img = await createImageFromFile(file);

  return new Promise((resolve) => {
    try {
      const resizedResolution = {
        width: img.width,
        height: img.height,
      };

      if (img.width > options.maxWidth) {
        resizedResolution.height = (options.maxHeight / img.width) * img.height;
        resizedResolution.width = options.maxWidth;
      }
      if (img.height > options.maxHeight) {
        resizedResolution.width = (options.maxWidth / img.height) * img.width;
        resizedResolution.height = options.maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(resizedResolution.width);
      canvas.height = resizedResolution.height;
      canvas
        .getContext("2d")
        ?.drawImage(
          img,
          0,
          0,
          Math.floor(resizedResolution.width),
          Math.floor(resizedResolution.height)
        );

      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error(`cannot convert canvas to file`);
          resolve({
            file: new File([blob], file.name, { type: file.type }),
            width: Math.floor(resizedResolution.width),
            height: Math.floor(resizedResolution.height),
          });
        },
        file.type,
        0.8
      );
    } catch (error) {
      console.error(error);
      resolve({ file, width: img.width, height: img.height });
    }
  });
}
