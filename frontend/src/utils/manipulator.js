
export const extractSlug =  (uri) => {
  try {
    const slug = uri.split(`${window.location.origin}/`)[1];
    return slug;
  } catch (err) {
    return ""
  }
}

export const reconstructBlobUrl =  (slug) => {
  try {
    return `blob:${window.location.origin}/${slug}`;
  } catch (err) {
    return ""
  }
}

export const extractNameFromEncryptedFileName =  (filename) => {
  try {
    const name = filename.split(`encrypted_`)[1].split('.')[0].replaceAll('-', ' ');
    return name;
  } catch (err) {
    return ""
  }
}