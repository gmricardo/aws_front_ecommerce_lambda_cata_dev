# Despliegue a S3 desde GitHub Actions

Este documento explica cómo configurar y probar el workflow de GitHub Actions que compila este frontend y sincroniza la carpeta `dist/` a un bucket público de S3.

## Resumen
- Workflow: `.github/workflows/deploy-to-s3.yml`
- Se dispara en pushes a la rama `integration`.
- Requiere que el `npm run build` genere `dist/`.
- Sube los archivos de `dist/` al bucket S3 definido en el secret `S3_BUCKET`.

## Secrets requeridos en GitHub (Settings → Secrets and variables → Actions)
- `AWS_ACCESS_KEY_ID` : Access key de la IAM usada por Actions.
- `AWS_SECRET_ACCESS_KEY` : Secret key de la IAM.
- `AWS_REGION` : Ejemplo `us-east-1`.
- `S3_BUCKET` : Nombre del bucket (p. ej. `bucket-cata-dev`).

> Nota: No es necesario `CLOUDFRONT_DISTRIBUTION_ID` ya que no se usa CloudFront en este repo.

## Permisos IAM recomendados
Crear una policy con permisos mínimos para el despliegue (ejemplo):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::bucket-cata-dev"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::bucket-cata-dev/*"
      ]
    }
  ]
}
```

Reemplaza `bucket-cata-dev` por el nombre real del bucket.

## Crear el bucket S3 (opcional, con AWS CLI)
Estos comandos asumen `AWS_REGION` ya configurada en tu entorno o usan `--region`.

```bash
# Crear bucket (ejemplo, para us-east-1 no pongas --create-bucket-configuration)
aws s3api create-bucket --bucket bucket-cata-dev --region us-east-1

# Desactivar bloqueo de acceso público si quieres objetos públicos (también se puede configurar en consola)
aws s3api put-public-access-block --bucket bucket-cata-dev --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

# (Opcional) Habilitar static website hosting
aws s3 website s3://bucket-cata-dev/ --index-document index.html --error-document index.html

# Añadir policy pública de sólo lectura para los objetos (permite acceso público a objetos)
cat > bucket-policy.json <<'POL'
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"PublicReadGetObject",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::bucket-cata-dev/*"]
    }
  ]
}
POL

aws s3api put-bucket-policy --bucket bucket-cata-dev --policy file://bucket-policy.json

```

Advertencia: Hacer un bucket completamente público tiene implicaciones de seguridad y costes si los archivos se descargan masivamente. Si necesitas protección, considera CloudFront con restricciones o políticas más estrictas.

## Comprobar localmente antes de empujar

1. Instala dependencias y construye:

```bash
npm ci
npm run build
```

2. Verifica que `dist/` existe y tiene `index.html`:

```bash
ls -la dist | head
```

3. (Opcional) Probar sincronizar localmente con `aws s3` para simular lo que hará el workflow:

```bash
export S3_BUCKET=bucket-cata-dev
aws s3 sync dist/ s3://$S3_BUCKET --delete --acl public-read --cache-control "max-age=31536000,public"
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html --acl public-read --cache-control "no-cache, no-store, must-revalidate"
```

## Qué hace exactamente el workflow
- Usa `actions/checkout@v4`.
- Configura credenciales con `aws-actions/configure-aws-credentials@v4` usando los secrets.
- Instala Node.js y ejecuta `npm ci` y `npm run build`.
- Sincroniza `dist/` con el bucket indicado en `S3_BUCKET` usando `aws s3 sync`.
- Establece `Cache-Control` largo para assets y `no-cache` para `index.html`.

## Disparar el despliegue
- Haz push a la rama `integration`. El workflow sólo corre en esa rama.
- En GitHub → Actions → selecciona el workflow `Build and Deploy to S3 (Integration)` para ver logs.

## Troubleshooting común
- Error: `S3_BUCKET secret is not set` → agrega el secret `S3_BUCKET` en Settings → Secrets.
- Error de permisos `AccessDenied` → revisa la policy IAM de la credencial usada por Actions.
- `dist/` vacío o no encontrado → confirma que `npm run build` realmente crea `dist/`.
- Objetos no públicos → revisa Public Access Block del bucket y la bucket policy.

## Mejoras opcionales
- Añadir `actions/cache` para cachear `~/.npm` y acelerar `npm ci`.
- Usar CloudFront delante del bucket para mejor caching y HTTPS con certificados ACM.
- Ajustar `Cache-Control` por tipo de archivo (JS/CSS/PNG → largo; HTML → no-cache).

---
Si quieres, añado ahora:
- `actions/cache` al workflow para acelerar builds.
- Un step que valide que `dist/` no esté vacío antes de `aws s3 sync`.
- Un archivo `iam-policy.json` en el repo con la policy recomendada.

¿Qué prefieres que haga ahora?
