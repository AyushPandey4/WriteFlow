import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { supabase } from "@/lib/supabaseClient";
import { getUserId } from "@/getUserId";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload an image to Cloudinary
export async function POST(req) {
  try {
    const user = await getUserId(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Upload to Cloudinary
    const buffer = await file.arrayBuffer();
    const base64File = Buffer.from(buffer).toString("base64");
    const uploadedImage = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64File}`,
      { folder: "blog_thumbnails" }
    );

    // Save to Supabase
    const { data: newImage, error: insertError } = await supabase
      .from("images")
      .insert([{
        user_id: user,
        image_url: uploadedImage.secure_url
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Fetch all images uploaded by the current user
export async function GET(req) {
  try {
    const user = await getUserId(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: images, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", user)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// Delete an image from gallery
export async function DELETE(req) {
  try {
    const user = await getUserId(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image_id } = await req.json();
    if (!image_id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Verify image belongs to user
    const { data: image, error: findError } = await supabase
      .from("images")
      .select("*")
      .eq("id", image_id)
      .eq("user_id", user)
      .single();

    if (findError) throw findError;
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    const urlParts = image.image_url.split("/");
    const publicId = urlParts[urlParts.length - 1].split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    // Delete from DB
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", image_id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}