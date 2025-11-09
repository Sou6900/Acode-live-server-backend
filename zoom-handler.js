// // zoom-handler.js (Updated & Fixed)

// export default class ZoomHandler {
//   constructor(element) {
//     this.element = element;
//     if (!this.element) return;

//     // Initialize all state properties
//     this.finalScale = 1;
//     this.tempScale = 1; // Scale during the gesture
//     this.offsetX = 0;
//     this.offsetY = 0;
    
//     this.panning = false; // True when pinch-zooming
//     this.isPanningContent = false; // True when dragging/panning
    
//     this.initialDistance = 0;
//     this.panStart = null;
    
//     // ✅ NEW: The point on the element (unscaled) being pinched
//     this.pinchPoint = null; 

//     // Bind methods to ensure `this` is always correct
//     this.handleTouchStart = this.handleTouchStart.bind(this);
//     this.handleTouchMove = this.handleTouchMove.bind(this);
//     this.handleTouchEnd = this.handleTouchEnd.bind(this);
//     this.handleDoubleTap = this.handleDoubleTap.bind(this);

//     this.setupZoomEvents();
//   }

//   setupZoomEvents() {
//     const updateTouchAction = () => {
//       this.element.style.touchAction = this.finalScale > 1 ? 'none' : 'auto';
//     };
//     updateTouchAction();

//     // ✅ Always set (0,0) as origin. We will control position with translate.
//     this.element.style.transformOrigin = '0 0';

//     this.element.addEventListener('touchstart', this.handleTouchStart);
//     this.element.addEventListener('touchmove', this.handleTouchMove);
//     this.element.addEventListener('touchend', (e) => {
//       this.handleTouchEnd(e);
//       updateTouchAction(); 
//     });
//     this.element.addEventListener('touchcancel', this.handleTouchEnd);
//     this.element.addEventListener('dblclick', this.handleDoubleTap);
//   }

//   destroy() {
//     this.element.removeEventListener('touchstart', this.handleTouchStart);
//     this.element.removeEventListener('touchmove', this.handleTouchMove);
//     this.element.removeEventListener('touchend', this.handleTouchEnd);
//     this.element.removeEventListener('touchcancel', this.handleTouchEnd);
//     this.element.removeEventListener('dblclick', this.handleDoubleTap);
//   }
  
//   getDistance(p1, p2) {
//     const dx = p1.clientX - p2.clientX;
//     const dy = p1.clientY - p2.clientY;
//     return Math.sqrt(dx * dx + dy * dy);
//   }

//   // ✅ UPDATED METHOD
//   handleTouchStart(e) {
//     if (e.touches.length === 2) {
//       e.preventDefault();
//       this.panning = true; // Start zoom gesture
//       this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      
//       // Calculate the point on the *element* (unscaled) that is being pinched
//       const screenOriginX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//       const screenOriginY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
//       // Formula: (screen_pinch_center - current_translation) / current_scale
//       this.pinchPoint = {
//         x: (screenOriginX - this.offsetX) / this.finalScale,
//         y: (screenOriginY - this.offsetY) / this.finalScale
//       };
      
//     } else if (e.touches.length === 1 && this.finalScale > 1) {
//       // Single finger panning start (this part was correct)
//       this.panStart = {
//         x: e.touches[0].clientX - this.offsetX,
//         y: e.touches[0].clientY - this.offsetY,
//       };
//       this.isPanningContent = true;
//     }
//   }

//   // ✅ UPDATED METHOD
//   handleTouchMove(e) {
//     const element = e.currentTarget;

//     // Pinch zoom (2 fingers)
//     if (this.panning && e.touches.length === 2) {
//       e.preventDefault();
      
//       // 1. Calculate new scale
//       const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
//       const gestureRatio = currentDistance / this.initialDistance;
//       let newScale = this.finalScale * gestureRatio;
//       newScale = Math.max(0.5, Math.min(newScale, 5));
//       this.tempScale = newScale; // Store intermediate scale

//       // 2. Calculate new screen center
//       const screenOriginX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
//       const screenOriginY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

//       // 3. Calculate new offsets to keep the pinchPoint at the screenOrigin
//       // Formula: new_offset = screen_pinch_center - (point_on_element * new_scale)
//       this.offsetX = screenOriginX - (this.pinchPoint.x * newScale);
//       this.offsetY = screenOriginY - (this.pinchPoint.y * newScale);

//       // 4. Apply transform (always from 0 0)
//       element.style.transform = `scale(${newScale}) translate(${this.offsetX}px, ${this.offsetY}px)`;
//     }

//     // Panning (1 finger drag)
//     else if (this.isPanningContent && e.touches.length === 1 && this.finalScale > 1) {
//       e.preventDefault();
//       const dx = e.touches[0].clientX - this.panStart.x;
//       const dy = e.touches[0].clientY - this.panStart.y;
//       this.offsetX = dx; // Update final offset
//       this.offsetY = dy; // Update final offset
      
//       // Apply transform using the *final* scale, not tempScale
//       element.style.transform = `scale(${this.finalScale}) translate(${dx}px, ${dy}px)`;
//     }
//   }

//   // ✅ UPDATED METHOD
//   handleTouchEnd(e) {
//     if (this.panning) {
//       this.panning = false;
//       this.finalScale = this.tempScale; // Commit the temporary scale
//       this.pinchPoint = null; // Clear the pinch point
//     }
//     if (this.isPanningContent) {
//       this.isPanningContent = false;
//       // The offsetX/Y are already committed by the pan move
//     }
//   }

//   // Double-tap to reset zoom (This part was correct)
//   handleDoubleTap(e) {
//     const element = e.currentTarget;
//     this.finalScale = 1;
//     this.tempScale = 1;
//     this.offsetX = 0;
//     this.offsetY = 0;
//     element.style.transition = 'transform 0.25s ease';
//     element.style.transformOrigin = '0 0'; // Ensure origin is reset
//     element.style.transform = 'scale(1) translate(0,0)';
//     setTimeout(() => {
//       element.style.transition = ''; // remove transition for next pinch
//     }, 300);
//   }
// }



// zoom-handler.js (Updated with Focus Lock) 60%

// export default class ZoomHandler {
//   constructor(element) {
//     this.element = element;
//     if (!this.element) return;

//     // --- State Properties ---
//     // Final committed values
//     this.finalScale = 1;
//     this.offsetX = 0;
//     this.offsetY = 0;
    
//     // Values during a gesture
//     this.tempScale = 1;
//     this.tempOffsetX = 0;
//     this.tempOffsetY = 0;

//     // Gesture tracking
//     this.panning = false; // True when pinch-zooming
//     this.isPanningContent = false; // True when dragging/panning
    
//     this.initialDistance = 0;
//     this.panStart = null;
    
//     // ✅ The screen point (e.g., {x: 150, y: 300}) where the zoom started.
//     // This is the "focus" we want to lock.
//     this.screenOrigin = null; 

//     // Bind methods
//     this.handleTouchStart = this.handleTouchStart.bind(this);
//     this.handleTouchMove = this.handleTouchMove.bind(this);
//     this.handleTouchEnd = this.handleTouchEnd.bind(this);
//     this.handleDoubleTap = this.handleDoubleTap.bind(this);

//     this.setupZoomEvents();
//   }

//   setupZoomEvents() {
//     const updateTouchAction = () => {
//       this.element.style.touchAction = this.finalScale > 1 ? 'none' : 'auto';
//     };
//     updateTouchAction();

//     // All transforms are relative to the top-left corner
//     this.element.style.transformOrigin = '0 0';

//     this.element.addEventListener('touchstart', this.handleTouchStart);
//     this.element.addEventListener('touchmove', this.handleTouchMove);
//     this.element.addEventListener('touchend', (e) => {
//       this.handleTouchEnd(e);
//       updateTouchAction(); 
//     });
//     this.element.addEventListener('touchcancel', this.handleTouchEnd);
//     this.element.addEventListener('dblclick', this.handleDoubleTap);
//   }

//   destroy() {
//     this.element.removeEventListener('touchstart', this.handleTouchStart);
//     this.element.removeEventListener('touchmove', this.handleTouchMove);
//     this.element.removeEventListener('touchend', this.handleTouchEnd);
//     this.element.removeEventListener('touchcancel', this.handleTouchEnd);
//     this.element.removeEventListener('dblclick', this.handleDoubleTap);
//   }
  
//   getDistance(p1, p2) {
//     const dx = p1.clientX - p2.clientX;
//     const dy = p1.clientY - p2.clientY;
//     return Math.sqrt(dx * dx + dy * dy);
//   }

//   // ✅ UPDATED (Now captures screenOrigin)
//   handleTouchStart(e) {
//     if (e.touches.length === 2) {
//       e.preventDefault();
//       this.panning = true; // Start zoom gesture
//       this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      
//       // ✅ Lock the screen center of the pinch
//       this.screenOrigin = {
//         x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
//         y: (e.touches[0].clientY + e.touches[1].clientY) / 2
//       };
      
//     } else if (e.touches.length === 1 && this.finalScale > 1) {
//       // Start single-finger panning
//       this.panStart = {
//         x: e.touches[0].clientX - this.offsetX,
//         y: e.touches[0].clientY - this.offsetY,
//       };
//       this.isPanningContent = true;
//     }
//   }

//   // ✅ UPDATED (New math for focus lock)
//   handleTouchMove(e) {
//     const element = e.currentTarget;

//     // Pinch zoom (2 fingers)
//     if (this.panning && e.touches.length === 2) {
//       e.preventDefault();
      
//       // 1. Calculate new relative scale
//       const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
//       const gestureRatio = currentDistance / this.initialDistance;
      
//       // 2. Calculate new absolute scale
//       // this.tempScale হলো এই জুম সেশনের বর্তমান স্কেল
//       this.tempScale = this.finalScale * gestureRatio;
//       this.tempScale = Math.max(0.5, Math.min(this.tempScale, 5));

//       // 3. Calculate new offsets based on the LOCKED screenOrigin
//       // এই গণিতটি নিশ্চিত করে যে screenOrigin-এর নিচের কন্টেন্টটি ওখানেই থাকে
      
//       // gestureRatio-এর বদলে, আমরা (new_scale / old_scale) ব্যবহার করি
//       const scaleRatio = this.tempScale / this.finalScale;
      
//       // নতুন অফসেট গণনা করুন
//       // new_offset = screenOrigin * (1 - ratio) + old_offset * ratio
//       this.tempOffsetX = this.screenOrigin.x * (1 - scaleRatio) + this.offsetX * scaleRatio;
//       this.tempOffsetY = this.screenOrigin.y * (1 - scaleRatio) + this.offsetY * scaleRatio;

//       // 4. Apply transform
//       element.style.transform = `translate(${this.tempOffsetX}px, ${this.tempOffsetY}px) scale(${this.tempScale})`;
//     }

//     // Panning (1 finger drag)
//     else if (this.isPanningContent && e.touches.length === 1 && this.finalScale > 1) {
//       e.preventDefault();
      
//       // panned amount
//       const dx = e.touches[0].clientX - this.panStart.x;
//       const dy = e.touches[0].clientY - this.panStart.y;
      
//       // Store temporary values
//       this.tempOffsetX = dx;
//       this.tempOffsetY = dy;
      
//       element.style.transform = `translate(${dx}px, ${dy}px) scale(${this.finalScale})`;
//     }
//   }

//   // ✅ UPDATED (Commits temp values to final values)
//   handleTouchEnd(e) {
//     if (this.panning) {
//       this.panning = false;
//       this.finalScale = this.tempScale; // Commit scale
//       this.offsetX = this.tempOffsetX; // Commit offset X
//       this.offsetY = this.tempOffsetY; // Commit offset Y
//       this.screenOrigin = null; // Clear lock
//     }
//     if (this.isPanningContent) {
//       this.isPanningContent = false;
//       this.offsetX = this.tempOffsetX; // Commit offset X
//       this.offsetY = this.tempOffsetY; // Commit offset Y
//     }
//   }

//   // Double-tap to reset zoom
//   handleDoubleTap(e) {
//     const element = e.currentTarget;
//     this.finalScale = 1;
//     this.tempScale = 1;
//     this.offsetX = 0;
//     this.offsetY = 0;
//     this.tempOffsetX = 0;
//     this.tempOffsetY = 0;
    
//     element.style.transition = 'transform 0.25s ease';
//     element.style.transformOrigin = '0 0';
//     element.style.transform = 'translate(0,0) scale(1)';
//     setTimeout(() => {
//       element.style.transition = '';
//     }, 300);
//   }
// }







// zoom-handler.js (Updated with Null Checks)

export default class ZoomHandler {
  constructor(element) {
    this.element = element;
    if (!this.element) return;
    
    // ✅ চেষ্টা করুন scroller খুঁজে বের করার, কিন্তু null হলেও সমস্যা নেই
    this.scroller = this.element.parentNode; 

    // --- State Properties ---
    this.finalScale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.tempScale = 1;
    this.tempOffsetX = 0;
    this.tempOffsetY = 0;

    // Gesture tracking
    this.panning = false;
    this.isPanningContent = false;
    
    this.initialDistance = 0;
    this.panStart = null;
    this.pageOrigin = null; 

    // Bind methods
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleDoubleTap = this.handleDoubleTap.bind(this);

    this.setupZoomEvents();
  }

  setupZoomEvents() {
    const updateTouchAction = () => {
      this.element.style.touchAction = this.finalScale > 1 ? 'none' : 'auto';
    };
    updateTouchAction();
    this.element.style.transformOrigin = '0 0';

    this.element.addEventListener('touchstart', this.handleTouchStart);
    this.element.addEventListener('touchmove', this.handleTouchMove);
    this.element.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e);
      updateTouchAction(); 
    });
    this.element.addEventListener('touchcancel', this.handleTouchEnd);
    this.element.addEventListener('dblclick', this.handleDoubleTap);
  }

  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchEnd);
    this.element.removeEventListener('dblclick', this.handleDoubleTap);
  }
  
  getDistance(p1, p2) {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * ✅ UPDATED: Scroller (স্ক্রলার) খুঁজে বের করার জন্য সুরক্ষিত করা হয়েছে
   */
  getPageCoordinates(e_touches) {
    // ✅ যদি scroller null থাকে (constructor-এ ফেইল হলে), আবার খোঁজার চেষ্টা করুন
    if (!this.scroller || !this.scroller.getBoundingClientRect) {
      this.scroller = this.element.parentNode;
      
      // ✅ যদি এখনও খুঁজে না পাওয়া যায়, তবে ফেইল করুন
      if (!this.scroller || !this.scroller.getBoundingClientRect) {
        console.error("ZoomHandler Error: Cannot find scroller parent element.");
        return null; // এরর প্রতিরোধ করতে null রিটার্ন করুন
      }
    }

    const scrollerRect = this.scroller.getBoundingClientRect();
    const scrollLeft = this.scroller.scrollLeft;
    const scrollTop = this.scroller.scrollTop;

    const screenX = (e_touches[0].clientX + (e_touches[1]?.clientX || e_touches[0].clientX)) / e_touches.length;
    const screenY = (e_touches[0].clientY + (e_touches[1]?.clientY || e_touches[0].clientY)) / e_touches.length;

    const x_in_scroller_viewport = screenX - scrollerRect.left;
    const y_in_scroller_viewport = screenY - scrollerRect.top;

    return {
      x: x_in_scroller_viewport + scrollLeft,
      y: y_in_scroller_viewport + scrollTop
    };
  }

  // ✅ UPDATED (Null check যোগ করা হয়েছে)
  handleTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      
      // ✅ স্থানাঙ্ক (coordinates) প্রথমে নিন
      this.pageOrigin = this.getPageCoordinates(e.touches);
      // ✅ যদি scroller খুঁজে না পাওয়া যায়, তবে জুম শুরু করবেন না
      if (!this.pageOrigin) return; 

      // স্থানাঙ্ক সফলভাবে পেলে তবেই জুম শুরু করুন
      this.panning = true; 
      this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      
    } else if (e.touches.length === 1 && this.finalScale > 1) {
      // ✅ স্থানাঙ্ক প্রথমে নিন
      const trueHit = this.getPageCoordinates(e.touches);
      // ✅ যদি scroller খুঁজে না পাওয়া যায়, তবে প্যান শুরু করবেন না
      if (!trueHit) return; 

      // স্থানাঙ্ক সফলভাবে পেলে তবেই প্যান শুরু করুন
      this.isPanningContent = true;
      this.panStart = {
        x: trueHit.x - this.offsetX,
        y: trueHit.y - this.offsetY,
      };
    }
  }

  // ✅ handleTouchMove (আগের মতোই, কিন্তু এখন সুরক্ষিত)
  handleTouchMove(e) {
    const element = e.currentTarget;

    // Pinch zoom (2 fingers)
    // ✅ this.panning এখন true হবেই না যদি না this.pageOrigin সেট করা থাকে
    if (this.panning && e.touches.length === 2) {
      e.preventDefault();
      
      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const gestureRatio = currentDistance / this.initialDistance;
      
      this.tempScale = this.finalScale * gestureRatio;
      this.tempScale = Math.max(0.5, Math.min(this.tempScale, 5));

      const scaleRatio = this.tempScale / this.finalScale;
      this.tempOffsetX = this.pageOrigin.x * (1 - scaleRatio) + this.offsetX * scaleRatio;
      this.tempOffsetY = this.pageOrigin.y * (1 - scaleRatio) + this.offsetY * scaleRatio;

      element.style.transform = `translate(${this.tempOffsetX}px, ${this.tempOffsetY}px) scale(${this.tempScale})`;
    }

    // Panning (1 finger drag)
    // ✅ this.isPanningContent এখন true হবেই না যদি না trueHit সেট করা থাকে
    else if (this.isPanningContent && e.touches.length === 1 && this.finalScale > 1) {
      e.preventDefault();
      
      const trueHit = this.getPageCoordinates(e.touches);
      if (!trueHit) return; // অতিরিক্ত সুরক্ষা
      
      this.tempOffsetX = trueHit.x - this.panStart.x;
      this.tempOffsetY = trueHit.y - this.panStart.y;
      
      element.style.transform = `translate(${this.tempOffsetX}px, ${this.tempOffsetY}px) scale(${this.finalScale})`;
    }
  }

  // ... (handleTouchEnd এবং handleDoubleTap অপরিবর্তিত) ...
  
  handleTouchEnd(e) {
    if (this.panning) {
      this.panning = false;
      this.finalScale = this.tempScale;
      this.offsetX = this.tempOffsetX;
      this.offsetY = this.tempOffsetY;
      this.pageOrigin = null; 
    }
    if (this.isPanningContent) {
      this.isPanningContent = false;
      this.offsetX = this.tempOffsetX;
      this.offsetY = this.tempOffsetY;
    }
  }

  handleDoubleTap(e) {
    const element = e.currentTarget;
    this.finalScale = 1;
    this.tempScale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.tempOffsetX = 0;
    this.tempOffsetY = 0;
    
    element.style.transition = 'transform 0.25s ease';
    element.style.transformOrigin = '0 0';
    element.style.transform = 'translate(0,0) scale(1)';
    setTimeout(() => {
      element.style.transition = '';
    }, 300);
  }
}