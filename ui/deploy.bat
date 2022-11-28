@ECHO OFF 
ng build --prod
COPY "./manifest.yml" "./dist/fuse"
COPY "./StaticFile" "./dist/fuse"
cd dist/fuse
cf push -f manifest.yml
