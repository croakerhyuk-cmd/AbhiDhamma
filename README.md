# citta atlas · 마음의 지도

54가지 마음을 분류의 렌즈별로 탐색하는 인터랙티브 아비담마 시각화 프로젝트입니다. 카드형 픽토그램, 검색, 상세 패널, 분류 전환 애니메이션을 포함합니다. 데이터는 편집 가능한 YAML로 분리되어 있습니다.

## 실행 및 데이터 편집

`npm run dev`로 개발 서버를 실행하고 `http://localhost:3000`에서 확인합니다. `npm run build`로 배포 전 검증을 실행합니다.

마음 데이터는 `data/cittas.yaml`, 분류 기준은 `data/classifications.yaml`, 출처 메모는 `data/sources.yaml`에서 편집합니다. 분류 파일에 그룹을 추가하고 마음의 `attributes`에 같은 키를 넣으면 UI가 자동으로 그룹화합니다. 54개에 고정된 코드는 없으므로 89/121개로 확장할 수 있습니다.

GitHub repository를 Vercel에 연결하면 main push는 Production 배포, Pull Request는 Preview 배포가 됩니다. 별도 환경변수는 필요하지 않습니다.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
