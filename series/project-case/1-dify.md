---
title: Dify
description: A guide to the Dify platform.
date: '2025-8-26'
tags:
  - RAG

order: 1
image: /dify.png
draft: false
---

### Case 1: Dify - AI-Powered Platform for Building Custom AI Assistants
#### docker-compose
```md
# 🔥 核心业务服务
docker-api-1          # ✅ API 服务 (50分钟前重启)
docker-worker-1       # ✅ 异步任务处理 (51分钟前重启)
docker-web-1          # ✅ 前端界面 (8天前启动)

# 🗄️ 数据存储服务  
docker-db-1           # ✅ PostgreSQL (8天前，健康状态)
docker-redis-1        # ✅ Redis 缓存 (8天前，健康状态)
docker-weaviate-1     # ✅ 向量数据库 (8天前)

# 🛡️ 安全和代理服务
docker-nginx-1        # ✅ 反向代理 (端口 80, 443)
docker-ssrf_proxy-1   # ✅ 安全代理 (端口 3128)
docker-sandbox-1      # ✅ 代码执行沙盒 (健康状态)
```
1. 宿主机调试web服务, 将本机5001端口映射到容器5001端口
```sh
docker-compose run -d --name api-with-port -p 5001:5001 api
docker-compose run --remove-orphans -d --name api-with-port -p 5001:5001 api
```
2. 每个docker构建时可以指定entrypoint，如下：
```bash
docker inspect langgenius/dify-api:0.15.3
```
```json
[
    {
        "Id": "sha256:20a7c498bbbe4340f52b3d1ad10a0cff5b48670c9df634b4d37d2335b3a1fd5f",
        "RepoTags": [
            "langgenius/dify-api:0.15.3"
        ],
        "RepoDigests": [
            "langgenius/dify-api@sha256:20a7c498bbbe4340f52b3d1ad10a0cff5b48670c9df634b4d37d2335b3a1fd5f"
        ],
        "Parent": "",
        "Comment": "buildkit.dockerfile.v0",
        "Created": "2025-02-07T07:21:48.778695828Z",
        "DockerVersion": "27.5.1",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "5001/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/app/api/.venv/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "LANG=C.UTF-8",
                "GPG_KEY=7169605F62C751356D054A26A821E680E5FA6305",
                "PYTHON_VERSION=3.12.9",
                "PYTHON_SHA256=7220835d9f90b37c006e9842a8dff4580aaca4318674f947302b8d28f3f81112",
                "POETRY_VERSION=2.0.1",
                "POETRY_CACHE_DIR=/tmp/poetry_cache",
                "POETRY_NO_INTERACTION=1",
                "POETRY_VIRTUALENVS_IN_PROJECT=true",
                "POETRY_VIRTUALENVS_CREATE=true",
                "POETRY_REQUESTS_TIMEOUT=15",
                "FLASK_APP=app.py",
                "EDITION=SELF_HOSTED",
                "DEPLOY_ENV=PRODUCTION",
                "CONSOLE_API_URL=http://127.0.0.1:5001",
                "CONSOLE_WEB_URL=http://127.0.0.1:3000",
                "SERVICE_API_URL=http://127.0.0.1:5001",
                "APP_WEB_URL=http://127.0.0.1:3000",
                "TZ=UTC",
                "VIRTUAL_ENV=/app/api/.venv",
                "COMMIT_SHA=ca19bd31d42fb87c83b91541c473ebae85e9d14e"
            ],
            "Cmd": null,
            "Image": "",
            "Volumes": null,
            "WorkingDir": "/app/api",
            "Entrypoint": [
                "/bin/bash",
                "/entrypoint.sh"
            ],
            "OnBuild": null,
            "Labels": {
                "org.opencontainers.image.created": "2025-02-07T07:22:00.026Z",
                "org.opencontainers.image.description": "Dify is an open-source LLM app development platform. Dify's intuitive interface combines AI workflow, RAG pipeline, agent capabilities, model management, observability features and more, letting you quickly go from prototype to production.",
                "org.opencontainers.image.licenses": "NOASSERTION",
                "org.opencontainers.image.revision": "ca19bd31d42fb87c83b91541c473ebae85e9d14e",
                "org.opencontainers.image.source": "https://github.com/langgenius/dify",
                "org.opencontainers.image.title": "dify",
                "org.opencontainers.image.url": "https://github.com/langgenius/dify",
                "org.opencontainers.image.version": "0.15.3"
            }
        },
        "Architecture": "arm64",
        "Os": "linux",
        "Size": 933205404,
        "GraphDriver": {
            "Data": null,
            "Name": "overlayfs"
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:3ec51339a507de1c80397e41016d23da1e6fa610d7176da42ce5e46fb2ce4686",
                "sha256:6838097029a0c4494588dcc97ff9e765ead8daaf071078613d7a2c4e6c8d68b1",
                "sha256:c20414e1266b02ccdb2018891cbf0364eba09afdb3d54511e0be36666c0f1752",
                "sha256:d12bcb450636b4bcc1300671fe901b64decd87d8768beb7a1a7ecc7181f112f1",
                "sha256:afe2638210f8a6d6dbe8f921697724b84cf6405253ac08fd6956686a228187d3",
                "sha256:6e002622cc7796c007b41a310675de0d934cd8f6e5c71bfc3eb42932d4d00d38",
                "sha256:5f70bf18a086007016e948b04aed3b82103a36bea41755b6cddfaf10ace3c6ef",
                "sha256:e5b7f5ff849677dc43af0f84e320b4d5e6988c2a209c168195ea4842723c96a4",
                "sha256:8b431d6c83a0883dcdfb258cb6de383c0cd8febaf5a50e2f834e37f4f6b5475b",
                "sha256:2efb0d3d066159887842f34db49fb2984066d35ad0bb5e97434c73a16fefe11c",
                "sha256:919ccd6ea255f0d511b191eac089ca583350be5fe436e40666b466ad9a07a24a",
                "sha256:bb59441e69cfdb7090694fd32fcf08a8c68e83f996c71959cb140393f84c675c",
                "sha256:5f70bf18a086007016e948b04aed3b82103a36bea41755b6cddfaf10ace3c6ef"
            ]
        },
        "Metadata": {
            "LastTagTime": "2025-03-16T13:14:06.137999008Z"
        }
    }
]
```
#### api
#### ngnix
#### db(TODO)
#### web
`前端交互界面`
1. 登录
```javascript
  const handleEmailPasswordLogin = async () => {
    if (!email) {
      Toast.notify({ type: 'error', message: t('login.error.emailEmpty') })
      return
    }
    if (!emailRegex.test(email)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.emailInValid'),
      })
      return
    }
    if (!password?.trim()) {
      Toast.notify({ type: 'error', message: t('login.error.passwordEmpty') })
      return
    }
    if (!passwordRegex.test(password)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.passwordInvalid'),
      })
      return
    }
    try {
      setIsLoading(true)
      const loginData: Record<string, any> = {
        email,
        password,
        language: locale,
        remember_me: true,
      }
      if (isInvite)
        loginData.invite_token = decodeURIComponent(searchParams.get('invite_token') as string)
      const res = await login({
        url: '/login',
        body: loginData,
      })
      if (res.result === 'success') {
        if (isInvite) {
          router.replace(`/signin/invite-settings?${searchParams.toString()}`)
        }
        else {
          localStorage.setItem('console_token', res.data.access_token)
          localStorage.setItem('refresh_token', res.data.refresh_token)
          router.replace('/apps')
        }
      }
      else if (res.code === 'account_not_found') {
        if (allowRegistration) {
          const params = new URLSearchParams()
          params.append('email', encodeURIComponent(email))
          params.append('token', encodeURIComponent(res.data))
          router.replace(`/reset-password/check-code?${params.toString()}`)
        }
        else {
          Toast.notify({
            type: 'error',
            message: t('login.error.registrationNotAllowed'),
          })
        }
      }
      else {
        Toast.notify({
          type: 'error',
          message: res.data,
        })
      }
    }

    finally {
      setIsLoading(false)
    }
  }

  return <form onSubmit={() => { }}>
    <div className='mb-3'>
      <label htmlFor="email" className="my-2 system-md-semibold text-text-secondary">
        {t('login.email')}
      </label>
      <div className="mt-1">
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isInvite}
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('login.emailPlaceholder') || ''}
          tabIndex={1}
        />
      </div>
    </div>

    <div className='mb-3'>
      <label htmlFor="password" className="my-2 flex items-center justify-between">
        <span className='system-md-semibold text-text-secondary'>{t('login.password')}</span>
        <Link
          href={`/reset-password?${searchParams.toString()}`}
          className={`system-xs-regular ${isEmailSetup ? 'text-components-button-secondary-accent-text' : 'text-components-button-secondary-accent-text-disabled pointer-events-none'}`}
          tabIndex={isEmailSetup ? 0 : -1}
          aria-disabled={!isEmailSetup}
        >
          {t('login.forget')}
        </Link>
      </label>
      <div className="relative mt-1">
        <Input
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              handleEmailPasswordLogin()
          }}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={t('login.passwordPlaceholder') || ''}
          tabIndex={2}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            type="button"
            variant='ghost'
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👀' : '😝'}
          </Button>
        </div>
      </div>
    </div>

    <div className='mb-2'>
      <Button
        tabIndex={2}
        variant='primary'
        onClick={handleEmailPasswordLogin}
        disabled={isLoading || !email || !password}
        className="w-full"
      >{t('login.signBtn')}</Button>
    </div>
  </form>
}

```

