using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(WikiDive.Startup))]
namespace WikiDive
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
