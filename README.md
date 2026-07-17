# citta atlas · 마음의 지도

54가지 마음을 분류의 렌즈별로 탐색하는 인터랙티브 아비담마 시각화 프로젝트입니다. 카드형 픽토그램, 검색, 상세 패널, 분류 전환 애니메이션을 포함합니다. 데이터는 편집 가능한 YAML로 분리되어 있습니다.

## 실행 및 데이터 편집

`npm run dev`로 개발 서버를 실행하고 `http://localhost:3000`에서 확인합니다. `npm run build`로 배포 전 검증을 실행합니다.

데이터는 다음 계층으로 편집합니다. `data/datasets.yaml`의 대분류를 선택하면 같은 이름의 `data/dhamma_group/<id>.yaml`을 읽습니다. 각 담마그룹 항목이 지정한 `item`과 `classification` 파일은 각각 `data/item/`과 `data/classification/`에서 읽히며, 아이템의 `groups`에 적은 그룹 id와 분류 파일의 그룹 id가 카드를 연결합니다. 분류 그룹에 하위 `groups`를 추가하면 화면에서 해당 그룹을 눌러 다음 단계로 이동합니다.

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
