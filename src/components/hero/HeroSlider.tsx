import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Slider from 'react-slick';

import { Movie } from '../../lib/types';
import { getTMDBBackdropUrl } from '../../lib/tmdb';
import { formatYear } from '../../lib/utils';

interface HeroSliderProps {
  movies: Movie[];
}

export default function HeroSlider({ movies }: HeroSliderProps) {
  const sliderRef = useRef<Slider>(null);

  // Guard against empty array
  if (!movies || movies.length === 0) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false, // We use custom arrows
    fade: true,
    pauseOnHover: true,
    swipe: true,
    appendDots: (dots: any) => (
      <div style={{ bottom: '30px', position: 'absolute', width: '100%' }}>
        <ul style={{ margin: '0px', padding: '0px', display: 'flex', justifyContent: 'center', gap: '8px' }}> 
          {dots} 
        </ul>
      </div>
    ),
    customPaging: (i: number) => (
      <div className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-all custom-dot" />
    )
  };

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden group">
      <Slider ref={sliderRef} {...settings} className="h-full hero-slider">
        {movies.map((movie) => (
          <div key={movie.id} className="relative w-full h-[70vh] md:h-[80vh] outline-none">
             {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={getTMDBBackdropUrl(movie.backdrop_path, 'original')}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-6 md:px-12 flex items-center">
              <div className="max-w-3xl pt-20">
                <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
                  {movie.title}
                </h1>
                <div className="flex items-center gap-6 mb-8 text-base md:text-lg font-medium text-white/90">
                  <span className="flex items-center gap-2 text-[var(--brand-accent)]">
                    <Star className="w-5 h-5 fill-current" /> {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-white/60">•</span>
                  <span>{formatYear(movie.release_date)}</span>
                </div>
                <p className="mb-10 text-base md:text-lg line-clamp-3 text-white/80 max-w-2xl leading-relaxed drop-shadow-md">
                  {movie.overview}
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    to={`/stream/movie/${movie.id}`}
                    className="flex items-center gap-3 px-8 py-4 bg-[var(--brand-primary)] hover:opacity-90 transition rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Play className="w-6 h-6 shrink-0" fill="currentColor" />
                    <span className="whitespace-nowrap">Watch Now</span>
                  </Link>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 transition rounded-xl backdrop-blur-md text-white font-semibold text-lg border border-white/10"
                  >
                    <Info className="w-6 h-6 shrink-0" />
                    <span className="whitespace-nowrap">More Info</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Navigation Arrows */}
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white/70 hover:text-white rounded-full transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Slick Carousel Core Styles & Custom Dots */}
      <style>{`
        /* Minimal Slick CSS */
        .slick-slider { box-sizing: border-box; user-select: none; -webkit-touch-callout: none; touch-action: pan-y; -webkit-tap-highlight-color: transparent; }
        .slick-list { overflow: hidden; margin: 0; padding: 0; }
        .slick-list:focus { outline: none; }
        .slick-list.dragging { cursor: pointer; cursor: hand; }
        .slick-slider .slick-track, .slick-slider .slick-list { transform: translate3d(0, 0, 0); }
        .slick-track { position: relative; top: 0; left: 0; display: block; margin-left: auto; margin-right: auto; }
        .slick-track:before, .slick-track:after { display: table; content: ''; }
        .slick-track:after { clear: both; }
        .slick-loading .slick-track { visibility: hidden; }
        .slick-slide { display: none; float: left; height: 100%; min-height: 1px; }
        [dir='rtl'] .slick-slide { float: right; }
        .slick-slide img { display: block; }
        .slick-slide.slick-loading img { display: none; }
        .slick-slide.slick-dragging img { pointer-events: none; }
        .slick-initialized .slick-slide { display: block; }
        .slick-loading .slick-slide { visibility: hidden; }
        .slick-vertical .slick-slide { display: block; height: auto; border: 1px solid transparent; }
        .slick-arrow.slick-hidden { display: none; }
        
        /* Custom Dot Styles */
        .slick-dots li.slick-active .custom-dot {
          background-color: var(--brand-primary) !important;
          width: 32px !important;
        }
        .hero-slider .slick-dots {
          bottom: 30px;
        }
      `}</style>
    </div>
  );
}
