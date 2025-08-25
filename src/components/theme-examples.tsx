// Ejemplos de uso del nuevo tema

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const ThemeExamples = () => {
  return (
    <div className="p-8 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-heading-1 text-brand-primary">
            Sistema de Diseño TaskWise
          </h1>
          <p className="text-body text-subtext-color">
            Demostración completa del nuevo tema oscuro con tipografía IBM Plex Mono
          </p>
        </div>

        {/* Tipografía */}
        <Card>
          <CardHeader>
            <CardTitle>Tipografía</CardTitle>
            <CardDescription>
              Todas las escalas tipográficas con IBM Plex Mono
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-heading-1">Heading 1 - 30px</h1>
              <h2 className="text-heading-2">Heading 2 - 20px</h2>
              <h3 className="text-heading-3">Heading 3 - 16px</h3>
              <p className="text-body-bold">Body Bold - 14px</p>
              <p className="text-body">Body Regular - 14px</p>
              <p className="text-caption-bold">Caption Bold - 12px</p>
              <p className="text-caption">Caption Regular - 12px</p>
              <code className="text-monospace-body">Monospace Body - 14px</code>
            </div>
          </CardContent>
        </Card>

        {/* Paleta de Colores */}
        <Card>
          <CardHeader>
            <CardTitle>Paleta de Colores</CardTitle>
            <CardDescription>
              Colores principales y semánticos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Brand Colors */}
              <div className="space-y-2">
                <h4 className="text-body-bold text-default-font">Brand</h4>
                <div className="space-y-1">
                  <div className="w-full h-12 bg-brand-500 flex items-center justify-center text-caption text-neutral-950">500</div>
                  <div className="w-full h-8 bg-brand-600 flex items-center justify-center text-caption text-neutral-950">600</div>
                  <div className="w-full h-8 bg-brand-700 flex items-center justify-center text-caption text-neutral-950">700</div>
                </div>
              </div>

              {/* Neutral Colors */}
              <div className="space-y-2">
                <h4 className="text-body-bold text-default-font">Neutral</h4>
                <div className="space-y-1">
                  <div className="w-full h-12 bg-neutral-50 flex items-center justify-center text-caption text-default-font">50</div>
                  <div className="w-full h-8 bg-neutral-200 flex items-center justify-center text-caption text-neutral-950">200</div>
                  <div className="w-full h-8 bg-neutral-500 flex items-center justify-center text-caption text-neutral-950">500</div>
                </div>
              </div>

              {/* Success Colors */}
              <div className="space-y-2">
                <h4 className="text-body-bold text-default-font">Success</h4>
                <div className="space-y-1">
                  <div className="w-full h-12 bg-success-500 flex items-center justify-center text-caption text-neutral-950">500</div>
                  <div className="w-full h-8 bg-success-600 flex items-center justify-center text-caption text-neutral-950">600</div>
                  <div className="w-full h-8 bg-success-700 flex items-center justify-center text-caption text-neutral-950">700</div>
                </div>
              </div>

              {/* Error Colors */}
              <div className="space-y-2">
                <h4 className="text-body-bold text-default-font">Error</h4>
                <div className="space-y-1">
                  <div className="w-full h-12 bg-error-500 flex items-center justify-center text-caption text-neutral-950">500</div>
                  <div className="w-full h-8 bg-error-600 flex items-center justify-center text-caption text-neutral-950">600</div>
                  <div className="w-full h-8 bg-error-700 flex items-center justify-center text-caption text-neutral-950">700</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componentes */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes UI</CardTitle>
            <CardDescription>
              Botones, inputs y otros elementos con el nuevo tema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Botones */}
            <div className="space-y-4">
              <h4 className="text-heading-3">Botones</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <h4 className="text-heading-3">Inputs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Input placeholder" />
                <Input type="password" placeholder="Password input" />
              </div>
              <Textarea placeholder="Textarea placeholder" rows={3} />
            </div>

            {/* Cards anidadas */}
            <div className="space-y-4">
              <h4 className="text-heading-3">Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-heading-3">Card Example</CardTitle>
                    <CardDescription>
                      Esta es una descripción de la tarjeta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body text-default-font">
                      Contenido de la tarjeta con el nuevo tema aplicado.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-heading-3">Otra Card</CardTitle>
                    <CardDescription>
                      Ejemplo de múltiples tarjetas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Acción en Card</Button>
                  </CardContent>
                </Card>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Estados y Variaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Estados y Variaciones</CardTitle>
            <CardDescription>
              Demostraciones de hover, focus y otros estados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-body text-default-font">
                Texto principal con color default-font
              </p>
              <p className="text-body text-subtext-color">
                Texto secundario con color subtext-color
              </p>
              <p className="text-body text-brand-primary">
                Texto con color brand-primary
              </p>
              <p className="text-body text-error-600">
                Texto de error
              </p>
              <p className="text-body text-success-600">
                Texto de éxito
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
