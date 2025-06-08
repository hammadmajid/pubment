export default function SVGPattern() {
  return (
    <div className='w-full max-w-md aspect-square'>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
      <svg
        viewBox='0 0 400 400'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        <g opacity='0.8'>
          <circle cx='100' cy='100' r='80' fill='#f472b6' fillOpacity='0.2' />
          <circle cx='300' cy='100' r='60' fill='#60a5fa' fillOpacity='0.2' />
          <circle cx='100' cy='300' r='60' fill='#34d399' fillOpacity='0.2' />
          <circle cx='300' cy='300' r='80' fill='#a78bfa' fillOpacity='0.2' />
          <circle cx='200' cy='200' r='100' fill='#fbbf24' fillOpacity='0.1' />
          <path
            d='M100,100 L300,100 L300,300 L100,300 Z'
            stroke='#6366f1'
            strokeWidth='2'
            strokeDasharray='10 5'
            fill='none'
          />
          <path
            d='M150,150 L250,150 L250,250 L150,250 Z'
            stroke='#ec4899'
            strokeWidth='2'
            strokeDasharray='5 5'
            fill='none'
          />
          <circle
            cx='200'
            cy='200'
            r='40'
            stroke='#8b5cf6'
            strokeWidth='2'
            fill='none'
          />
        </g>
      </svg>
    </div>
  );
}
