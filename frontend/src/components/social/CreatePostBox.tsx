import { useState, useRef } from 'react';
import { Image, Smile, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common';
import toast from 'react-hot-toast';

interface CreatePostBoxProps {
  onSubmit: (content: string, images?: File[]) => Promise<void>;
  placeholder?: string;
}

export default function CreatePostBox({ onSubmit, placeholder = "Bạn đang nghĩ gì?" }: CreatePostBoxProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} không phải là file ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 4) {
      toast.error('Chỉ được đăng tối đa 4 ảnh');
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages([...images, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc chọn ảnh');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(content, images);
      
      // Reset form
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setShowActions(false);
      toast.success('Đã đăng bài viết');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể đăng bài');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = () => {
    if (!user?.fullName) return '?';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return user.fullName[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header with Avatar */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">
              {getInitials()}
            </span>
          </div>
          {!showActions ? (
            <div className="flex-1">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setShowActions(true)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-800 placeholder-gray-500"
              />
            </div>
          ) : (
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user?.fullName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content Area */}
      {showActions && (
        <form onSubmit={handleSubmit} className="px-4 pb-4">
          {/* Full Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full px-0 py-2 border-none focus:ring-0 resize-none outline-none text-gray-800 placeholder-gray-500 text-[15px]"
            rows={5}
            autoFocus
          />

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className={`mb-3 grid gap-2 ${
              imagePreviews.length === 1 ? 'grid-cols-1' :
              imagePreviews.length === 2 ? 'grid-cols-2' :
              imagePreviews.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-gray-300">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-200 transition"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add to Post Section - Facebook Style */}
          <div className="mb-3 border border-gray-300 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">Thêm vào bài viết của bạn</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 4}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ảnh/Video"
              >
                <Image className="w-6 h-6 text-green-500" />
              </button>
              
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Cảm xúc/Hoạt động"
              >
                <Smile className="w-6 h-6 text-yellow-500" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={(!content.trim() && images.length === 0) || submitting}
            loading={submitting}
            className="w-full"
          >
            Đăng bài
          </Button>
        </form>
      )}

      {/* Quick Actions (when collapsed) - Divider Line */}
      {!showActions && (
        <>
          <div className="px-4 pb-2">
            <div className="border-t border-gray-300"></div>
          </div>
          <div className="flex items-center gap-1 px-4 pb-4">
            <button
              onClick={() => setShowActions(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Image className="w-6 h-6 text-green-500" />
              <span className="text-sm font-semibold">Ảnh/Video</span>
            </button>
            
            <button
              onClick={() => setShowActions(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Smile className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-semibold">Cảm xúc</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

