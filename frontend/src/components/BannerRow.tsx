import { Banner } from '../types';
import { getProductImageUrl } from '../utils/imageUrl';
import Carousel from './Carousel';
import SmartLink from './SmartLink';

/** یک یا دو بنر: شبکه‌ی هم‌اندازه با فاصله‌ی مشخص؛ بیشتر از دو بنر: اسکرول افقی. */
export default function BannerRow({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  const items = banners.map((b) => (
    <SmartLink key={b.id} to={b.linkUrl} className="kh-banner" title={b.title}>
      <img src={getProductImageUrl(b.imageUrl)} alt={b.title || ''} loading="lazy" />
    </SmartLink>
  ));

  if (banners.length <= 2) {
    return <div className={`kh-banner-grid cols-${banners.length}`}>{items}</div>;
  }
  return <Carousel className="kh-banner-row">{items}</Carousel>;
}
