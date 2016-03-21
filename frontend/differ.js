'use strict';

let
  diffWrap = document.querySelector('.tab-split'),
  splitter = document.querySelector('.splitter'),
  splitImgNew = document.getElementById('split-img-new'),
  splitImgRefCover = document.getElementById('split-img-ref-cover'),
  diffRange = document.getElementById('diff-range'),
  diff = document.getElementById('diff-img-diff')
  ;

const moveSplitter = function (x) {
  let newX = x - splitter.offsetWidth / 2;
  splitter.style.left = `${newX}px`;
};

const cropImage = function (x) {
  splitImgNew.style.webkitClipPath = `polygon(${x}px 0%, 100% 0%, 100% 100%, ${x}px 100%)`;
  splitImgRefCover.style.webkitClipPath = `polygon(${x}px 0%, 100% 0%, 100% 100%, ${x}px 100%)`;
};

const moveDiffer = function (x) {
  if (x >= 0 && x <= document.documentElement.clientWidth - splitter.offsetWidth) {
    moveSplitter(x);
    cropImage(x);
  }
};

const handleMouseMove = function (e) {
  moveDiffer(e.pageX)
};

const adjustDiff = function (opacity) {
  diff.style.opacity = opacity;
};

const setImages = function (imgsJson) {
  let imgs = JSON.parse(imgsJson.replace(/\\/g, '/'));

  document.getElementById('split-img-ref').src = `${imgs.ref}?${Date.now()}`;
  document.getElementById('split-img-new').src = `${imgs.new}?${Date.now()}`;
  document.getElementById('diff-img-ref').src = `${imgs.ref}?${Date.now()}`;
  document.getElementById('diff-img-new').src = `${imgs.new}?${Date.now()}`;
  document.getElementById('diff-img-diff').src = `${imgs.diff}?${Date.now()}`;

  diffRange.value = 0.5;
  moveDiffer(document.documentElement.clientWidth / 2);
};

diffWrap.addEventListener('mousedown', function (e) {
  moveDiffer(e.pageX);
  document.addEventListener('mousemove', handleMouseMove);
});

document.addEventListener('mouseup', function (e) {
  document.removeEventListener('mousemove', handleMouseMove);
});

diffRange.addEventListener('change', function (e) {
  adjustDiff(diffRange.value);
});

diffRange.addEventListener('input', function (e) {
  adjustDiff(diffRange.value);
});

adjustDiff(diffRange.value);
