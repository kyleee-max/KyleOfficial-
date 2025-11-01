import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: false, message: 'Method not allowed' });
    }

    try {
        const { fileType, fileURL } = req.body; // fileType: "image" | "video", fileURL: URL file dari Catbox

        if (!fileType || !fileURL) {
            return res.status(400).json({ status: false, message: 'fileType atau fileURL tidak ada' });
        }

        let apiURL = '';
        if (fileType === 'image') {
            apiURL = `https://api-faa.my.id/faa/hdv4?image=${encodeURIComponent(fileURL)}`;
        } else if (fileType === 'video') {
            apiURL = `https://api-faa.my.id/faa/hdvid?url=${encodeURIComponent(fileURL)}`;
        } else {
            return res.status(400).json({ status: false, message: 'fileType harus image atau video' });
        }

        const faaRes = await fetch(apiURL);
        const data = await faaRes.json();

        if (!data.status) {
            return res.status(500).json({ status: false, message: 'Gagal memproses file di FAA API' });
        }

        // Untuk video, URL di data.result.download_url
        // Untuk image, URL di data.result.image_upscaled
        const resultURL = fileType === 'image' ? data.result.image_upscaled : data.result.download_url;

        res.status(200).json({ status: true, resultURL });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Terjadi error server', error: err.message });
    }
}