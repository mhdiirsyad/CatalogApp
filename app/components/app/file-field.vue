<script setup lang="ts">
const props = defineProps<{
  multiple?: boolean;
  label?: string;
  maxFiles?: number;
  existingImages?: string[];
}>();

const config = useRuntimeConfig();
const selectedFiles = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const { $csrfFetch } = useNuxtApp();

// Track which existing images to keep (not deleted)
const remainingExistingImages = ref<string[]>([...props.existingImages || []]);

const previewUrls = computed(() => {
  // Combine existing images (that haven't been deleted) with new files
  const existingUrls = remainingExistingImages.value.map(key => ({
    url: `${config.public.s3PublicUrl}/${key}`,
    key,
    isExisting: true,
  }));

  const newUrls = selectedFiles.value.map(file => ({
    url: URL.createObjectURL(file),
    file,
    isExisting: false,
  }));

  return [...existingUrls, ...newUrls];
});

function selectImages(event: Event) {
  const input = event.target as HTMLInputElement;
  const fileList = input.files;
  if (fileList && fileList.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(fileList)];
    console.warn("Files selected:", selectedFiles.value.length);
    console.warn("Preview URLs:", previewUrls.value);
  }
}

function updateInputFiles() {
  if (!fileInputRef.value)
    return;

  const dataTransfer = new DataTransfer();
  selectedFiles.value.forEach((file) => {
    dataTransfer.items.add(file);
  });
  fileInputRef.value.files = dataTransfer.files;
}

function removeImage(index: number) {
  const preview = previewUrls.value[index];

  if (!preview)
    return;

  if (preview.isExisting && "key" in preview) {
    // Remove from remaining existing images
    remainingExistingImages.value = remainingExistingImages.value.filter(
      key => key !== preview.key,
    );
  }
  else if ("file" in preview) {
    // Remove from selected new files
    const fileIndex = selectedFiles.value.indexOf(preview.file);
    if (fileIndex !== -1) {
      selectedFiles.value = selectedFiles.value.filter((_, i) => i !== fileIndex);
      updateInputFiles();
    }
  }
}

async function resizeAndUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const previewImage = new Image();
    previewImage.addEventListener("load", async () => {
      try {
        const width = Math.min(1000, previewImage.width);
        const resizedImage = await createImageBitmap(previewImage, {
          resizeWidth: width,
        });
        const canvas = new OffscreenCanvas(width, resizedImage.height);
        canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(resizedImage);
        const blob = await canvas.convertToBlob({
          type: "image/jpeg",
          quality: 0.9,
        });

        const formData = new FormData();
        formData.append("file", blob, "image.jpeg");

        const { key } = await $csrfFetch<{ key: string }>("/api/images/image", {
          method: "post",
          body: formData,
        });

        resolve(key);
      }
      catch (error) {
        reject(error);
      }
    });
    previewImage.addEventListener("error", reject);
    previewImage.src = URL.createObjectURL(file);
  });
}

async function uploadImages(): Promise<string[]> {
  if (selectedFiles.value.length === 0)
    return [];

  const uploadPromises = selectedFiles.value.map(file => resizeAndUpload(file));
  const keys = await Promise.all(uploadPromises);
  return keys;
}

// Get list of images to delete (existing images that were removed)
function getImagesToDelete(): string[] {
  const initialImages = props.existingImages || [];
  return initialImages.filter(key => !remainingExistingImages.value.includes(key));
}

// Expose methods to parent
defineExpose({
  uploadImages,
  getImagesToDelete,
});
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ label || 'Product Images' }}
    </legend>
    <div>
      <p v-if="previewUrls.length === 0" class="text-sm text-gray-500">
        Select {{ multiple ? 'files' : 'a file' }}
      </p>
      <div v-else class="flex flex-row gap-4 overflow-x-auto py-2">
        <div
          v-for="(preview, index) in previewUrls"
          :key="index"
          class="relative flex w-32 h-32 shrink-0"
        >
          <img
            :src="preview.url"
            alt="Preview Image"
            class="w-full h-full object-cover rounded border"
          >
          <button
            type="button"
            class="absolute top-1 right-1 btn btn-circle btn-xs btn-error"
            @click="removeImage(index)"
          >
            ✕
          </button>
          <span
            v-if="preview.isExisting"
            class="absolute bottom-1 left-1 badge badge-sm badge-info"
          >
            Existing
          </span>
        </div>
      </div>
    </div>
    <input
      ref="fileInputRef"
      type="file"
      class="file-input w-full"
      :multiple="multiple"
      accept="image/*"
      @change="selectImages"
    >
    <label class="label">
      <span class="label-text-alt">Max size 1MB per image{{ multiple ? `, max ${maxFiles || 5} files` : '' }}</span>
      <span v-if="selectedFiles.length > 0" class="label-text-alt">{{ selectedFiles.length }} file(s) selected</span>
    </label>
  </fieldset>
</template>
