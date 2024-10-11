---
title: robomimic
description: robomimic, mimicgen, robosuite.
date: '2024-10-9'
tags:
  - sim
  - robot
  - ML
  - IL
order: 3
draft: false
---

# robomimic install 
1. `https://robomimic.github.io/docs/introduction/installation.html`安装pytorch时，将`-c pytorch`改为`-c conda-forge`
2.  出现如下错误不影响使用，但可以安装mojuco老版本
```sh
Exception ignored in: <function MjRenderContext.__del__ at 0x7f93584941f0>
Traceback (most recent call last):
  File "/home/camille/sim/robosuite/robosuite/utils/binding_utils.py", line 199, in __del__
    self.gl_ctx.free()
  File "/home/camille/sim/robosuite/robosuite/renderers/context/egl_context.py", line 149, in free
    EGL.eglMakeCurrent(EGL_DISPLAY, EGL.EGL_NO_SURFACE, EGL.EGL_NO_SURFACE, EGL.EGL_NO_CONTEXT)
  File "/home/camille/miniconda3/envs/robomimic_venv/lib/python3.8/site-packages/OpenGL/error.py", line 230, in glCheckError
    raise self._errorClass(
OpenGL.raw.EGL._errors.EGLError: EGLError(
        err = EGL_NOT_INITIALIZED,
        baseOperation = eglMakeCurrent,
        cArguments = (
                <OpenGL._opaque.EGLDisplay_pointer object at 0x7f9316871f40>,
                <OpenGL._opaque.EGLSurface_pointer object at 0x7f932cd56dc0>,
                <OpenGL._opaque.EGLSurface_pointer object at 0x7f932cd56dc0>,
                <OpenGL._opaque.EGLContext_pointer object at 0x7f932cd56d40>,
        ),
        result = 0
)
```
3. 其他问题比如cmake，libgl1-mesa-glx缺失等，直接`sudo apt install camke libgl1-mesa-glx`等

# mimicgen
1. 其实可以直接按照mimicgen的安装指南安装所有的`robomimic, mimicgen, robosuite.`,最后这三个可以放在一个文件夹里