import { Banner } from '../types';
import { getProductImageUrl } from '../utils/imageUrl';
import Carousel from './Carousel';
import SmartLink from './SmartLink';

/** ردیف بنرهای میانی صفحه (دو بنر کنار هم در دسکتاپ، اسکرول افقی در موبایل). */
export default function BannerRow({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  return (
    <Carousel className="kh-banner-row">
      {banners.map((b) => (
        <SmartLink key={b.id} to={b.linkUrl} className="kh-banner" title={b.title}>
          <img src={getProductImageUrl(b.imageUrl)} alt={b.title || ''} loading="lazy" />
        </SmartLink>
      ))}
    </Carousel>
  );
}
