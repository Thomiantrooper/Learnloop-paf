
import React from "react";
import Slider from "react-slick";

const PostMediaCarousel = ({ mediaUrls }) => {
  const settings = {
    dots: true,
    infinite: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <Slider {...settings}>
      {mediaUrls.map((url, idx) =>
        url.endsWith(".mp4") ? (
          <div key={idx}>
            <video controls className="w-full max-h-96 object-cover bg-black">
              <source src={url} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div key={idx}>
            <img src={url} alt="Media" className="w-full max-h-96 object-cover" />
          </div>
        )
      )}
    </Slider>
  );
};

export default PostMediaCarousel;
