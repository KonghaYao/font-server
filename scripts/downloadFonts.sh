mkdir -p ./data/fonts

curl -LJO https://github.com/Pal3love/Source-Han-TrueType/releases/download/2.004-2.001-1.002-R/SourceHanSansCN.zip
unzip SourceHanSansCN.zip -d ./data/fonts/
rm -f SourceHanSansCN.zip

curl -LJO https://github.com/atelier-anchor/smiley-sans/releases/download/v1.1.1/smiley-sans-v1.1.1.zip 
unzip smiley-sans-v1.1.1.zip -d ./data/fonts/
rm -f smiley-sans-v1.1.1.zip
