import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Share2, MessageCircle, Linkedin } from 'lucide-react';
import gsap from 'gsap';

interface ArticleProps {
  title: string;
  content: string;
  date: string;
  author: string;
  image?: string;
  onBack: () => void;
}

export default function Article({ title, content, date, author, image, onBack }: ArticleProps) {
  const { t } = useTranslation();
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.article-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }, articleRef);

    return () => ctx.revert();
  }, []);

  // Share to WeChat (opens share dialog)
  const shareToWeChat = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  // Share to Weibo
  const shareToWeibo = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${text}`, '_blank');
  };

  // Share to LinkedIn
  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
  };

  return (
    <div ref={articleRef} className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/70 hover:text-[#FFD700] transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">{t('article.back')}</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/50">{t('article.share')}</span>
              <div className="flex gap-2">
                <button
                  onClick={shareToWeChat}
                  className="w-9 h-9 rounded-lg bg-[#07C160]/20 flex items-center justify-center hover:bg-[#07C160]/30 transition-colors duration-300"
                  title={t('article.wechat')}
                >
                  <MessageCircle className="w-4 h-4 text-[#07C160]" />
                </button>
                <button
                  onClick={shareToWeibo}
                  className="w-9 h-9 rounded-lg bg-[#E6162D]/20 flex items-center justify-center hover:bg-[#E6162D]/30 transition-colors duration-300"
                  title={t('article.weibo')}
                >
                  <Share2 className="w-4 h-4 text-[#E6162D]" />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="w-9 h-9 rounded-lg bg-[#0A66C2]/20 flex items-center justify-center hover:bg-[#0A66C2]/30 transition-colors duration-300"
                  title={t('article.linkedin')}
                >
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="article-content max-w-4xl mx-auto px-6 py-12 opacity-0">
        {/* Meta */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-[#FFD700] text-sm">{date}</span>
          <span className="text-white/30">|</span>
          <span className="text-white/50 text-sm">{author}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
          {title}
        </h1>

        {/* Featured Image */}
        {image && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/50 text-sm mb-4">{t('article.share')}</p>
          <div className="flex gap-3">
            <button
              onClick={shareToWeChat}
              className="flex items-center gap-2 px-4 py-2 bg-[#07C160]/20 rounded-lg text-[#07C160] hover:bg-[#07C160]/30 transition-colors duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{t('article.wechat')}</span>
            </button>
            <button
              onClick={shareToWeibo}
              className="flex items-center gap-2 px-4 py-2 bg-[#E6162D]/20 rounded-lg text-[#E6162D] hover:bg-[#E6162D]/30 transition-colors duration-300"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{t('article.weibo')}</span>
            </button>
            <button
              onClick={shareToLinkedIn}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/20 rounded-lg text-[#0A66C2] hover:bg-[#0A66C2]/30 transition-colors duration-300"
            >
              <Linkedin className="w-4 h-4" />
              <span className="text-sm">{t('article.linkedin')}</span>
            </button>
          </div>
        </div>

        {/* Related Articles Placeholder */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6">{t('article.related')}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-300 cursor-pointer"
              >
                <span className="text-[#FFD700] text-xs">2024-03-0{i}</span>
                <h4 className="text-white font-medium mt-2">
                  {i === 1 ? 'FAC与香港科技大学签署战略合作协议' : '2024年香港创新生态发展报告'}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
