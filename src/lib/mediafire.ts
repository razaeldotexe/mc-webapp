export async function fetchMediaFireFolder(folderKey: string) {
  try {
    const url = `https://www.mediafire.com/api/1.5/folder/get_content.php?content_type=folders&filter=all&order_by=name&order_direction=asc&chunk=1&version=1.5&folder_key=${folderKey}&response_format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    if (data && data.response && data.response.folder_content) {
      return data.response.folder_content.folders || [];
    }
    return [];
  } catch (err) {
    console.error("Error fetching MediaFire folder:", err);
    return [];
  }
}

export async function fetchMediaFireFiles(folderKey: string) {
  try {
    const url = `https://www.mediafire.com/api/1.5/folder/get_content.php?content_type=files&filter=all&order_by=name&order_direction=asc&chunk=1&version=1.5&folder_key=${folderKey}&response_format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();

    if (data && data.response && data.response.folder_content) {
      return data.response.folder_content.files || [];
    }
    return [];
  } catch (err) {
    console.error("Error fetching MediaFire files:", err);
    return [];
  }
}
